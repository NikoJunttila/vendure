use: npx vendure migrate

For admin panel setup.
<br>
set currency to euro, set seller customfields (correct stripe account id for connected account id style acct_1QqucrPoTqZvD21C), set stripe secret and webhook,
add stripe payment and paytrail payment methods
<br>
add "multi" to all shipping methods when doing multi vendor.

for react dashboard npx vite 
<br>
hosting:
pm2 start ecosystem.config.js
copy built admin-ui from another server if using really weak vps
scp -r /c/Users/YourUsername/path/to/admin-ui your_vps_username@your_vps_ip:/srv/vendure/

Todo<br>
Email texts <br>


stripe testing. install stripe cli
stripe login
stripe listen --forward-to localhost:3000/payments/stripe

stripe keys should look like this: 
apikey: sk_test_51N0P...
webhook secret: whsec_21fed...
added in admin control panel stripe method: 
client needs this: PUBLIC_STRIPE_KEY=pk_test_51N0PJMLd...