import {
  Stack, StackProps,
  aws_iam as iam,
  aws_ec2 as ec2,
  aws_logs as logs,
  aws_efs as efs,
  aws_lambda as lambda,
  Duration
} from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class NodejsLambdaEfsVolumeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType("t3.nano"),
    });

    const vpc = new ec2.Vpc(this, "MySampleVPC", {
      natGatewayProvider,
      natGateways: 1,
      maxAzs: 1,
    });

    const myFileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
      vpc: vpc,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
    })

    const myPolicyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ["elasticfilesystem:*"],
          effect: iam.Effect.ALLOW,
          resources: [`arn:aws:elasticfilesystem:${props?.env?.region}:${props?.env?.account}:file-system/${myFileSystem.fileSystemId}`],
        }),
      ]
    });

    const lambdaAccessPoint = myFileSystem.addAccessPoint("EFSLambdaAccessPoint", {
      path: '/export/lambda',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '750'
      },
      posixUser: {
        uid: '1001',
        gid: '1001'
      }
    })

    const lambdaRole = new iam.Role(this, `MyLambdaRole`, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "Role assumed by the lambda function",
      inlinePolicies: {
        policy: myPolicyDocument
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole")
      ]
    });

    const mySampleLambda = new lambda.Function(
      this,
      "MySampleLambda",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        timeout: Duration.seconds(30),
        code: lambda.Code.fromAsset("lambda/"),
        vpc: vpc,
        filesystem: lambda.FileSystem.fromEfsAccessPoint(
          lambdaAccessPoint, "/mnt/filesystem"
        ),
        role: lambdaRole,
      }
    );
  }
}
