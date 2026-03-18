terraform {
  required_version = ">= 1.0"
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.73"
    }
  }
}

variable "virtual_environment_endpoint" { type = string }
variable "virtual_environment_api_token" { type = string }
variable "virtual_environment_username" { type = string }
variable "virtual_environment_password" { type = string }
variable "virtual_environment_auth_ticket" { type = string }
variable "virtual_environment_csrf_prevention_token" { type = string }

provider "proxmox" {
  endpoint = var.virtual_environment_endpoint
  api_token = var.virtual_environment_api_token
  # username =  var.virtual_environment_username
  # password = var.virtual_environment_password
  insecure = true

  ssh {
    agent = true
    username = "root"  # required when using api_token
  }
}
