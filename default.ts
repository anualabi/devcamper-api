// Move this file into "config" directory and update the values/settings with your own.

export default {
  dbUri: "",
  environment: "development",
  fileUploadPath: "./public/uploads",
  geocoder: {
    provider: "mapquest",
    apiKey: "",
  },
  jwtCookieExpires: 30,
  jwtExpire: "30d",
  jwtSecret: "",
  maxFileUpload: 1000000,
  port: 5000,
  smtpHost: "sandbox.smtp.mailtrap.io",
  smtpPort: 2525,
  smtpEmail: "",
  smtpPassword: "",
  fromEmail: "",
  fromName: "",
};
