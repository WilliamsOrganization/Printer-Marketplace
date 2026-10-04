# Just so you dont have to rediscover this later:
## aka dont rewrite stripe. just pass in configuration options at the time of order
use the new fields api that you just created to do all of this for you. 

when creating a checkout session if instead of passing it a lineitem id. you give it 
```json
  price_data: {
    currency: 'usd',
    unit_amount: 4000,              // in cents
    product: 'prod_ABC123',         // OR product_data: { name: 'Custom Print' }
  } 
```


This is in javascript but the Java version of the api will likely be exactly the same. 
just use the same effective .builder() for the required parameters. 
```javascript
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import java.util.Map;

SessionCreateParams params = SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
        SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
                SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("usd")
                    .setUnitAmount(calculatePrice(config)) // long, in cents
                    .setProduct("prod_ABC123")
                    .build()
            )
            .build()
    )
    .putAllMetadata(config) // Map<String, String> — see note below
    .setSuccessUrl("https://example.com/success")
    .setCancelUrl("https://example.com/cart")
    .build();

Session session = Session.create(params);
```
