import boto3
import argparse
import io
import joblib
import logging
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import AdaBoostClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def upload_to_s3(local_file_path, bucket_name, s3_file_name):
    """Upload the file to S3"""
    s3_client = boto3.client('s3')
    try:
        s3_client.upload_file(local_file_path, bucket_name, s3_file_name)
        logger.info(f"File uploaded to S3: s3://{bucket_name}/{s3_file_name}")
    except Exception as e:
        logger.error(f"Failed to upload file to S3: {e}")
        raise e


def _build_preprocessor():
    numeric_features = ['tenure', 'MonthlyCharges', 'TotalCharges']
    categorical_features = ['SeniorCitizen', 'Partner', 'Dependents',
                            'OnlineSecurity', 'OnlineBackup',
                            'DeviceProtection', 'TechSupport', 'Contract',
                            'PaperlessBilling', 'PaymentMethod']

    numeric_transformer = MinMaxScaler()
    categorical_transformer = OneHotEncoder(
        drop='first', handle_unknown="ignore"
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features),
        ],
        remainder='drop'
    )
    return preprocessor


def train(args):

    input_files = [
        os.path.join(args.train, file)
        for file in os.listdir(args.train)
        if os.path.splitext(os.path.basename(file))[1] == '.csv'
    ]

    if len(input_files) == 0:
        raise ValueError(f"No training files found at {args.train}")

    df_list = [pd.read_csv(file) for file in input_files]
    train_data = pd.concat(df_list)

    target_col = 'Churn'
    train_y = train_data[target_col].astype(int)
    train_X = train_data.drop(columns=[target_col])

    preprocessor = _build_preprocessor()

    clf = Pipeline(
        steps=[
            ('preprocessor', preprocessor),
            ('classifier', AdaBoostClassifier(
                learning_rate = args.learning_rate,
                n_estimators = args.n_estimators))
        ]
    )

    clf.fit(train_X, train_y)

    # Save the full pipeline
    joblib.dump(clf, os.path.join(args.model_dir, "model.joblib"))


def model_fn(model_dir):
    return joblib.load(os.path.join(model_dir, "model.joblib"))


def input_fn(input_data, content_type):
    if content_type == "text/csv":
        lines = input_data.strip().splitlines()

        # Check if first line contains filename
        if lines[0].startswith("# Filename:"):
            filename = lines[0].split(":", 1)[1].strip()
            lines = lines[1:]  # Remove metadata row
        else:
            filename = "default"

        lines = [lines[0][2:-1].replace("\\n", "\n")]
        df = pd.read_csv(io.StringIO("\n".join(lines)))
        user_ids = df['customerID'] if 'customerID' in df.columns else None
        return df, user_ids, filename

    elif content_type == "application/x-npy":
        # code to handle input data when predictor.predict() is called from
        # the .ipynb file itself.

        array = np.load(io.BytesIO(input_data), allow_pickle=True)

        # Case 1: If it's a scalar string (0-D array)
        if isinstance(array, np.ndarray) and array.ndim == 0: 
            csv_string = array.item()
            df = pd.read_csv(io.StringIO(csv_string))
            user_ids = df['customerID'] if 'customerID' in df.columns else None

        # Case 2: If it's a 1D or 2D numeric/textual array, convert to DataFrame
        elif isinstance(array, np.ndarray):
            if array.ndim == 1:
                array = array.reshape(1, -1)  # Reshape to 2D
            df = pd.DataFrame(array)

            user_ids = df['customerID'] if 'customerID' in df.columns else None

        return df, user_ids, None
    else:
        logger.info(f"Error in input_fn. Input Data: {input_data}")
        raise ValueError(f"Unsupported content type: {content_type}")


def predict_fn(input_data, model):
    try:
        df, user_ids, filename = input_data
        predictions = model.predict(df)

        if user_ids is not None:
            result = pd.DataFrame({
                'user_id': user_ids,
                'prediction': predictions
            })
        else:
            result = pd.DataFrame({
                'prediction': predictions
            })

        # Save to /tmp directory and get the file path
        output_file = "/tmp/predictions.csv"
        result.to_csv(output_file, index=False)

        if filename is not None:
            pred_bucket_name = "customer-churn-inference"
            pred_folder_name = "inferences"

            s3_file_name = f"{pred_folder_name}/{filename}"

            upload_to_s3(output_file, pred_bucket_name, s3_file_name)

            # Return the S3 file path
            return f"s3://{pred_bucket_name}/{s3_file_name}"
        else:
            return predictions
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise e


# Entry point
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-data-dir", type=str, default=os.environ["SM_OUTPUT_DATA_DIR"])
    parser.add_argument("--model-dir", type=str, default=os.environ["SM_MODEL_DIR"])
    parser.add_argument("--train", type=str, default=os.environ["SM_CHANNEL_TRAIN"])

    parser.add_argument('--learning-rate', type=float, default=1.0)
    parser.add_argument('--n-estimators', type=int, default=50)

    args = parser.parse_args()
    train(args)
