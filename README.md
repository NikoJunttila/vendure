<br>
add "multi" to all shipping methods when doing multi vendor.
<br>
set currency to euro, set seller customfields (correct stripe account id for connected account id style acct_1QqucrPoTqZvD21C), set stripe secret and webhook,


use: npx vendure migrate

for react dashboard npx vite 
<br>
hosting:
pm2 start ecosystem.config.js
scp -r /c/Users/YourUsername/path/to/admin-ui your_vps_username@your_vps_ip:/srv/vendure/

Todo<br>
Email texts <br>

stripe testing. install stripe cli
stripe login
stripe listen --forward-to localhost:3000/payments/stripe