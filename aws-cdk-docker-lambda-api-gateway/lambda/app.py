import json


def lambda_handler(event, context):
    request = json.loads(event['body'])
    resp = {
        "outputType": "image",
        "output": request['url']
    }
    return {
        "statusCode": 200,
        "headers": {},
        "body": json.dumps(resp)
    }
