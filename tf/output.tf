output "region" {
  description = "AWS REGION"
  value       = local.region
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}


output "eks_cluster_name" {
  description = "EKS CLUSTER NAME"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS CLUSTER ENDPOINT"
  value       = module.eks.cluster_endpoint
}


output "public_ip" {
  description = "EC2 INSTANCE PUBLIC IP"
  value       = aws_instance.ec2_instance.public_ip
}

output "eks_node_group_public_ips" {
  description = "EKS NODE GROUP INSTANCE PUBLIC IPs"
  value       = data.aws_instances.eks_nodes.public_ips
}