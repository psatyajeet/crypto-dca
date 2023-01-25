# What this does

This creates a lambda handler that can handle preset events, which are passed in, with an `action` variable that maps to a specific enum `Action`. The event also includes parameters with the coin to process and an amount. 

How does add funds work? 
1. Adds funds from your connected bank account to Coinbase. It will add enough funds for the buy amounf

How does buy work?
1. Adds funds from your connected bank account to Coinbase. It will add enough funds for the daily buy amount
2. Waits 15 minutes for funds to clear
3. Buys the coin you indicated (COIN_TO_BUY) for the daily buy amount

---

# To deploy, I used an AWS Lambda

## Do the first time

- [Install docker](https://docs.docker.com/install/)

# Running Lambda locally

- `docker build . -t crypto-dca`
- `docker run --rm -p 8080:8080 crypto-dca`
- `aws --profile personal lambda invoke --region us-east-1 --endpoint http://localhost:8080 --no-sign-request --function-name function --cli-binary-format raw-in-base64-out --payload '{"a": "b"}' output.txt`

# Pushing Lambda container image to ECR

## First time only

-  Login to ECR (you may have to do this again to re-authenticate)
  - `aws --profile personal ecr get-login-password  --region us-east-1 | docker login --username AWS --password-stdin {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com`
- Create a new repository in ECR to store the Lambda function
  - `aws --profile personal ecr create-repository --repository-name crypto-dca --image-scanning-configuration scanOnPush=true`

## Execute all steps

- `export DOCKER_REGISTRY={AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com && make docker_build_and_push`
- Then make sure to hit the button "Deploy new image" on the Lambda console

OR

## Build 

- `docker build . -t crypto-dca` or `make build`

## Push

- `docker tag crypto-dca {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/crypto-dca:latest` or `make tag`
- `docker push {REPLACE_WITH_AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/crypto-dca:latest`

## Setup Lambda

- We'll use an EventBridge (CloudWatch Events) as a trigger
- Create some test events. Here is an AddFunds event
```
{
  "action": "addFunds",
  "coin": "ETH",
  "amount": 40
}
```
- Here is a BuyEvent for ETH
```
{
  "action": "buyCoins",
  "coin": "ETH",
  "amount": 40
}
```

---

# Additional Docker Setup or Debugging

- [Install docker](https://docs.docker.com/install/)
- Build docker images: `docker build . -t crypto-dca`
- Run docker image: `docker run -p 49160:8080 -d crypto-dca`
  - or `docker run -p 9000:8080 -d crypto-dca`
- Debugging
  - List containers (with container id) - `docker ps`
  - Show logs - `docker logs [container id]`
- To enter the machine: `docker exec -it [container id] /bin/bash`
- Kill docker image: `docker kill [container id]`

---