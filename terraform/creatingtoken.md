Creating an API Token on the Proxmox Server

You can create an API Token via the Proxmox UI or the command line on the Proxmox host:

    Create a user:

``` bash
pveum user add terraform@pve
```

    Create a role for the user (you can skip this step if you want to use any of the existing roles):

``` bash
pveum role add Terraform -privs "Realm.AllocateUser, VM.PowerMgmt, VM.GuestAgent.Unrestricted, Sys.Console, Sys.Audit, Sys.AccessNetwork, VM.Config.Cloudinit, VM.Replicate, Pool.Allocate, SDN.Audit, Realm.Allocate, SDN.Use, Mapping.Modify, VM.Config.Memory, VM.GuestAgent.FileSystemMgmt, VM.Allocate, SDN.Allocate, VM.Console, VM.Clone, VM.Backup, Datastore.AllocateTemplate, VM.Snapshot, VM.Config.Network, Sys.Incoming, Sys.Modify, VM.Snapshot.Rollback, VM.Config.Disk, Datastore.Allocate, VM.Config.CPU, VM.Config.CDROM, Group.Allocate, Datastore.Audit, VM.Migrate, VM.GuestAgent.FileWrite, Mapping.Use, Datastore.AllocateSpace, Sys.Syslog, VM.Config.Options, Pool.Audit, User.Modify, VM.Config.HWType, VM.Audit, Sys.PowerMgmt, VM.GuestAgent.Audit, Mapping.Audit, VM.GuestAgent.FileRead, Permissions.Modify"
```

    Note

    The list of available privileges has changed in PVE 9.0. The above list is only an example (and likely too permissive for most use cases). Please review and adjust to your needs. Refer to the privileges documentation for more details.

    Assign the role to the previously created user:

``` bash
pveum aclmod / -user terraform@pve -role Terraform
```

    Create an API token for the user:

``` bash
pveum user token add terraform@pve provider --privsep=0
```

    Note

    Make sure you copy the token value, as it will not be displayed again.
