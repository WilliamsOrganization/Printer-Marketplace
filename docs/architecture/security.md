# WE ARE ONLY USING SESSION TOKENS GOING FORWARD. 
## DO NOT TRY TO REEARCH JWT TOKENS AGAIN. 
stateful invalidation of those tokens are annoying to handle. aka going from auth -> not auth. 
next js does handle this but I prefer the backend handle it (simpler frontend doesnt need a "decryption key" plus its client facing I dont trust em much anyway) 
single source of truth no complexity and distributed systems have a smaller attach service. 
dont keep revisiting this architecturally. session tokens are the way to go. simpleter 
then they can scale via redis when the time comes.  (will likely never happen anyways.)

## what we do need to start reconsidering is rolling our own auth. 
properly investigate options relating to spring security and next auth. 
I still like the use of session tokens. and keeping things centralized. 

considering the option of jwt signing with a secret key and sharing the public key with the backend to certify request authorities. 
CONSIDERING. I don't know what that means for session tracking over time. but its an option. 
I would like to get better about understanding and utilizing asymmetric cryptography. public private jwt key pairs
I have a feeling I will need to understand them better going forward. 

# FINALLY FIGURED OUT THE AUTH REWRITE.
## good lord this is going to be way simpler. 
just gonna wrap the application in this blocking request. then the page will guarunteed have a session and I need never worry about requests without session tokens. because they can't exist
``` tsx

export function AuthWrapper({ children }:{ children: React.ReactNode}){
    const auth = useQuery({
        queryKey: ['auth'],
        queryFn: getCurrentUser,
        retry: true, // double check what this does via the *** DOCUMENTATION ****
    })
    if (auth.isPending){
        return <LoadingScreen/> // make happy  -- bo burnham
    }
    if (auth.isError){
        return <ErrorScreen/> // could not initialize a session
    }
    return children

}

```
## Usage
``` tsx index.tsx
return (
    <AuthWrapper>
        <App/>
    </AuthWrapper>
)
```

# backend will maybe be using spring boots built in session handler. 
### key takaway I don't want to manage this myself.  
could be worth keeping our existing session handler. 
due to our custom account elevation principals. 
do more research before rewriting. might not be necessary at all. 

``` xml 
  <dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-jdbc</artifactId>
  </dependency>

```
``` application.properties
  spring.session.store-type=jdbc
  spring.session.jdbc.initialize-schema=always   # ships SPRING_SESSION + SPRING_SESSION_ATTRIBUTES DDL
  spring.session.timeout=24h
```
