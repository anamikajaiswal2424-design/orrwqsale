# Vercel setup

1. Upload this project's files to a private GitHub repository. Do not upload any `.env` file.
2. In Vercel, import that GitHub repository. The project root is this folder, framework is Create React App, build command is `CI=false npm run build`, output directory is `build`.
3. In Project > Settings > Environment Variables, enter the secret values from your existing `src/api/.env` for Production. At minimum configure `MONGODB_URI` and `MONGODB_DB`; use `POOL_CREATE_URL` and `POOL_API_KEY` for pool rotation, or `FALLBACK_UPI_ID` for fallback. Add `PAYMENT_WEBHOOK_TOKEN` for the notification endpoint. Check `src/api/.env.example` for other optional names.
4. Deploy or redeploy after adding variables. Check `https://YOUR-DOMAIN/api/payment/health`.
5. Set the payment provider webhook URL to `https://YOUR-DOMAIN/api/payment/notification`.

Keep actual keys out of GitHub and the browser. Rotate any credentials that were present in previously shared ZIP files.
