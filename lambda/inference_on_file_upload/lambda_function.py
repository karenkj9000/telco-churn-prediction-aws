import boto3
import csv
import io
import json
import os

def lambda_handler(event, context):
    # TODO implement
    # AWS clients
    s3 = boto3.client('s3')
    runtime = boto3.client('sagemaker-runtime')

    # ENV vars
    ENDPOINT_NAME = os.environ.get('ENDPOINT_NAME')

    record = event['Records'][0]['s3']
    input_bucket = record['bucket']['name']
    input_key = record['object']['key']
    file_name = os.path.basename(input_key)

    # Download the file from S3
    obj = s3.get_object(Bucket=input_bucket, Key=input_key)
    file_content = obj['Body'].read()
    final_file_content = f"# Filename: {file_name}\n{file_content}"
 
    # Send the raw content to SageMaker for prediction
    response = runtime.invoke_endpoint(
        EndpointName=ENDPOINT_NAME,
        ContentType='text/csv',
        Body=final_file_content
    )

    out_path = response['Body'].read().decode('utf-8')

    return {
        'statusCode': 200,
        'body': json.dumps(f'Predictions saved to {out_path}')
    }