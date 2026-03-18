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
variable "virtual_environment_secret" { type = string }
variable "ssh_public_key_file" { type = string}


provider "proxmox" {

  endpoint  = var.virtual_environment_endpoint
  api_token = var.virtual_environment_secret
  # TODO: configure a CI/CD pipeline simple ssh onto server git pul and docker compose up --build
  # username =  var.virtual_environment_username
  # password = var.virtual_environment_password
  insecure = true

  ssh {
    agent    = true
    username = "root" # required when using api_token
  }
}

resource "proxmox_virtual_environment_container" "debian" {
  node_name    = "plex" # your proxmox node name
  unprivileged = true

  initialization {
    hostname = "debian-test"
    user_account {
      keys = [file(var.ssh_public_key_file)]
    }

    ip_config {
      ipv4 {
        address = "192.168.1.54/24"
        gateway = "192.168.1.1"
      }
    }
  }

  network_interface {
    name = "eth0"
  }

  operating_system {
    template_file_id = "local:vztmpl/debian-12-standard_12.12-1_amd64.tar.zst"
    type             = "debian"
  }

  disk {
    datastore_id = "local-lvm"
    size         = 8
  }

  cpu { cores = 1 }
  memory { dedicated = 512 }
  features {
    nesting = true
  }

}

# provisioner "remote-exec" {
#   inline = [
#     "apt-get update && apt-get install -y docker.io docker-compose-plugin git",
#     "git clone https://github.com/ewanchukwilliam/Printer-Marketplace /app",
#     "cd /app && docker compose up -d --build"
#   ]
# connection {
# type = "ssh"
# user = "root"
# agent = true
# host = "192.168.1.54"
# }
# }
