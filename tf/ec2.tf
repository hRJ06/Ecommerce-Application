data "aws_ami" "os_image" {
  owners = ["099720109477"]
  most_recent = true
  filter {
    name   = "state"
    values = ["available"]
  }
  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/*24.04-amd64*"]
  }
}

resource "aws_key_pair" "key_pair" {
  key_name   = "EC2-Key"
  public_key = file("EC2-Key.pub")
}

resource "aws_default_vpc" "default" {

}

resource "aws_security_group" "ec2_sg" {
  name        = "ALLOW TLS"
  description = "ALLOW USER TO ACCESS"
  vpc_id      = aws_default_vpc.default.id
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "ALLOW ALL OUTGOING TRAFFIC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "ALLOW USER TO ACCESS APPLICATION"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "EC2-SG"
  }
}

resource "aws_instance" "ec2_instance" {
  ami             = data.aws_ami.os_image.id
  instance_type   = var.instance_type 
  key_name        = aws_key_pair.key_pair.key_name
  security_groups = [aws_security_group.ec2_sg.name]
  user_data = file("${path.module}/install_tool.sh")
  tags = {
    Name = "JENKINS-AUTOMATE"
  }
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
  
}