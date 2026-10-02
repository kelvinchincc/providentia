POST {{BASE}}/api/auth/login
Content-Type: application/json

[Options]
variable: username=testuser
variable: password=testpassword

{
  "username": "{{username}}",
  "password": "{{password}}"
}
