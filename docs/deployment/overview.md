# develop 

## local staging environment. 
### future plans
- feature branches
- shippo rates table
- inventoryitems json price tiers. just going to be an implementation of tables (item, itemgroup, itemgroupoptions)

## staging environment
- staging environment will deploy with changes pushed to the develop branch. (merges specifically)
- this staging environment will be the live https://dev.littlebrick3dprinting.ca site
- this will have a live stripe interceptor that well update the webhook listener. 
``` bash
stripe login
stripe listen --forward-to localhost:8080/stripe/webhook
```
- needs mock testing as they have limited testing support for shippo integration
- same resend email configuration will be shared between develop and production

### future plans not yet implemented. 
- separate bucket addresses.
- telemetry staging
- docker compose -> kubernetes cluster. 

## Production
- stripe needs a proper live key environment.
- requires White listing IP the shippo webhook address for receiving shipping updates.
- production S3 bucket with proper permissions
- shippo needs to have amys canada wise business shipping license with canada post configured


