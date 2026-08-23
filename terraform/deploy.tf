terraform {
  required_version = ">= 1.0"
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.73"
    }
  }

  # State has to live outside the CI workspace - actions/checkout cleans
  # (git clean -ffdx) before every run, which would otherwise wipe
  # terraform.tfstate along with everything else untracked/gitignored.
  # This NFS mount persists across runs and across which VM the runner
  # happens to be.
  backend "local" {
    path = "/mnt/ecommerce/terraform/terraform.tfstate"
  }
}

variable "proxmox_host_endpoint" { type = string }
variable "proxmox_environment_secret" { type = string }
variable "ssh_public_key" { type = string }
variable "node_name" { type = string }
variable "vm_name" { type = string }
variable "vm_ip" { type = string }
variable "vm_gateway" { type = string }
variable "vm_cidr" { type = string }
variable "image_user" { type = string }

variable "proxmox_datastore_id" { type = string }
variable "template_vm_id" { type = number }
variable "proxmox_ssh_username" { type = string }
variable "proxmox_ssh_key_path" { type = string }
variable "nfs_server" { type = string }
variable "nfs_protected_export" { type = string }
variable "nfs_mount_point" { type = string }

provider "proxmox" {
  endpoint  = var.proxmox_host_endpoint
  api_token = var.proxmox_environment_secret
  // self signed certificate
  insecure = true

  ssh {
    # username    = "root"
    username = var.proxmox_ssh_username
    # private_key = file("~/.ssh/id_ed25519") # snippet uploads (source_raw) go over SSH, not the API - Proxmox has no upload endpoint for the "snippets" content type
    private_key = file(var.proxmox_ssh_key_path)
  }
}

resource "proxmox_virtual_environment_file" "clone_mount" {
  content_type = "snippets"
  # datastore_id = "proxmox-templates"
  datastore_id = var.proxmox_datastore_id
  node_name    = var.node_name

  source_raw {
    file_name = "clone-mount.yaml"
    data      = <<-EOF
    #cloud-config
    mounts:
      # - [ "192.168.1.50:/mnt/storage/test-protected", "/mnt/test", "nfs", "defaults,_netdev", "0", "0" ]
      - [ "${var.nfs_server}:${var.nfs_protected_export}", "${var.nfs_mount_point}", "nfs", "defaults,_netdev", "0", "0" ]
    EOF
  }
}

resource "proxmox_virtual_environment_vm" "ecommerce_environment" {
  name      = var.vm_name
  node_name = var.node_name

  clone {
    # vm_id = 9999
    vm_id = var.template_vm_id
    full  = false # linked clone - fast/cheap, proves the template's COW base actually works
  }

  cpu {
    cores = 2
    type  = "host"
  }

  memory {
    dedicated = 2048 * 8
  }

  agent {
    enabled = true # qemu-guest-agent is already installed/enabled from the template, so this responds immediately
    timeout = "30s" # 5 minutes
  }

  operating_system {
    type = "l26"
  }

  network_device {
    bridge = "vmbr0"
    model  = "virtio"
  }

  serial_device {} # lets you run `qm terminal <vmid>` on the Proxmox host for a real scrolling console, instead of the noVNC display

  initialization {
    datastore_id        = "proxmox-templates"
    vendor_data_file_id = proxmox_virtual_environment_file.clone_mount.id # merges with Proxmox's own generated user-data (SSH key, user account) instead of replacing it - user_data_file_id would have overridden that entirely

    user_account {
      username = var.image_user

      keys = [
        var.ssh_public_key
      ]
    }

    ip_config {
      ipv4 {
        address = "${var.vm_ip}/${var.vm_cidr}"
        gateway = var.vm_gateway
      }
    }
  }
}
