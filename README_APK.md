# 📱 TeDevo - Geração de APK Android no GitHub Actions

Este repositório está 100% preparado para compilar o APK nativo do Android automaticamente via **GitHub Actions** usando **Capacitor**.

---

## 🔒 Permissões Configuradas no `AndroidManifest.xml`

Todas as 6 permissões solicitadas já estão declaradas e configuradas em `android/app/src/main/AndroidManifest.xml`:

1. **Agenda / Calendário**:
   - `android.permission.READ_CALENDAR`
   - `android.permission.WRITE_CALENDAR`
   *(Permite adicionar lembretes de vencimento e pagamentos como a faxina quinzenal)*

2. **Notificações Push**:
   - `android.permission.POST_NOTIFICATIONS`
   - `android.permission.VIBRATE`
   - `android.permission.WAKE_LOCK`
   - `android.permission.RECEIVE_BOOT_COMPLETED`
   *(Permite receber push em tempo real quando cobranças ou pagamentos forem feitos)*

3. **Fotos e Arquivos**:
   - `android.permission.READ_MEDIA_IMAGES`
   - `android.permission.READ_MEDIA_VIDEO`
   - `android.permission.READ_MEDIA_AUDIO`
   - `android.permission.READ_EXTERNAL_STORAGE`
   - `android.permission.WRITE_EXTERNAL_STORAGE`
   *(Permite anexar comprovantes de Pix, notas e recibos)*

4. **Câmera**:
   - `android.permission.CAMERA`
   - `android.hardware.camera`
   *(Permite fotografar comprovantes diretamente pelo app)*

5. **Microfone**:
   - `android.permission.RECORD_AUDIO`
   - `android.permission.MODIFY_AUDIO_SETTINGS`
   *(Permite gravar notas de voz sobre despesas compartilhadas)*

6. **Internet**:
   - `android.permission.INTERNET`
   - `android.permission.ACCESS_NETWORK_STATE`

---

## 🚀 Como Gerar e Baixar o APK no GitHub

O fluxo automatizado está em `.github/workflows/build-apk.yml`.

1. **Envie o código para o seu repositório no GitHub** (push para a branch `main` ou `master`).
2. No GitHub, clique na aba **Actions**.
3. Você verá o workflow **"Build TeDevo Android APK"** executando automaticamente (ou clique em **Run workflow**).
4. O GitHub Actions executará:
   - Configuração do Java JDK 17 e Android SDK.
   - Compilação dos arquivos web com `npm run build`.
   - Sincronização do Capacitor com `npx cap sync android`.
   - Compilação do APK nativo com `./gradlew assembleDebug`.
5. Ao concluir, role a página até a seção **Artifacts** e faça o download de **`tedevo-app-debug-apk`**.
6. Transfira o `.apk` para o seu celular Android e instale normalmente!
