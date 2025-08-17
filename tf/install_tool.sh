#!/bin/bash

# UPDATE
sudo apt update

# JDK
sudo apt install -y fontconfig openjdk-17-jre 

# JENKINS
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get -y install jenkins

sudo systemctl start jenkins
sudo systemctl enable jenkins

# DOCKER
sudo apt-get update
sudo apt-get install docker.io -y

# PERMISSION
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins

sudo systemctl restart docker
sudo systemctl restart jenkins

# TRIVY
sudo apt-get install wget apt-transport-https gnupg lsb-release snapd -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update -y
sudo apt-get install trivy -y

# AWS CLI
sudo snap install aws-cli --classic

# HELM
sudo snap install helm --classic

# KUBECTL
sudo snap install kubectl --classic