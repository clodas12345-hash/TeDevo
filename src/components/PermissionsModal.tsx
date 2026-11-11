import { useState, useRef } from 'react';
import { 
  Bell, 
  Camera, 
  Mic, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Github, 
  X,
  Play,
  Square
} from 'lucide-react';

interface PermissionsModalProps {
  onClose: () => void;
}

export function PermissionsModal({ onClose }: PermissionsModalProps) {
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPhoto, setCameraPhoto] = useState<string | null>(null);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [pushTestSent, setPushTestSent] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Notificações Push
  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification('TeDevo - Notificações Ativadas! 🔔', {
          body: 'Você receberá alertas sempre que cobrarem ou pagarem você no TeDevo.',
          icon: '/icon.svg'
        });
        setPushTestSent(true);
      }
    } else {
      alert('Seu navegador ou dispositivo não possui suporte à API de Notificações.');
    }
  };

  const handleSendTestPush = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TeDevo: Notificação Push de Teste 💸', {
        body: 'Cátia confirmou a dívida de R$ 90,00 no aplicativo.',
        icon: '/icon.svg'
      });
      setPushTestSent(true);
    } else {
      handleRequestNotification();
    }
  };

  // 2. Câmera
  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        mediaStreamRef.current = stream;
        setCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
      } catch (err: any) {
        alert('Erro ao acessar a câmera: ' + (err.message || 'Permissão negada.'));
      }
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCameraPhoto(dataUrl);
        handleToggleCamera();
      }
    }
  };

  // 3. Microfone
  const handleToggleAudioRecording = async () => {
    if (audioRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setAudioRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setAudioRecording(true);
      } catch (err: any) {
        alert('Erro ao acessar o microfone: ' + (err.message || 'Permissão negada.'));
      }
    }
  };

  // 4. Arquivos e Fotos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  // 5. Agenda / Calendário
  const handleExportToCalendar = () => {
    // Generate .ics file for calendar reminder
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TeDevo//App de Dividas//PT',
      'BEGIN:VEVENT',
      `UID:tedevo-${Date.now()}@tedevo.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${new Date(Date.now() + 15 * 86400000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'SUMMARY:Lembrete TeDevo: Faxina Quinzenal Apartamento (R$ 150)',
      'DESCRIPTION:Lembrete de pagamento quinzenal da faxina no aplicativo TeDevo.',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lembrete_tedevo.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Pinned Header (Always visible) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Permissões & Gerar APK
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configurado para compilar o APK no GitHub Actions com todas as permissões.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (cameraActive && mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
              }
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          
          {/* GitHub APK Workflow Status Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-100">
              <Github className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>GitHub Actions: <code>.github/workflows/build-apk.yml</code></span>
            </div>
            <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed text-[11px]">
              Ao enviar o código para o GitHub, o APK é gerado automaticamente e fica disponível para download direto na aba <strong>Actions</strong> do seu repositório.
            </p>
          </div>

          {/* Permissions Grid */}
          <div className="space-y-3">
            
            {/* 1. Notificações Push */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                    <span>Notificações Push</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      notificationStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {notificationStatus === 'granted' ? 'Ativadas ✅' : 'Pendente de Permissão'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receba avisos instantâneos quando alguém registrar ou confirmar dívidas com você.
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto shrink-0">
                {notificationStatus !== 'granted' ? (
                  <button
                    onClick={handleRequestNotification}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
                  >
                    Permitir Notificações
                  </button>
                ) : (
                  <button
                    onClick={handleSendTestPush}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
                  >
                    {pushTestSent ? 'Testar Novamente' : 'Enviar Push de Teste'}
                  </button>
                )}
              </div>
            </div>

          {/* 2. Câmera */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Permissão de Câmera (Fotos de Comprovantes)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Permite tirar fotos de notas fiscais, contas e comprovantes de Pix.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleCamera}
                className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95 shrink-0"
              >
                {cameraActive ? 'Fechar Câmera' : 'Testar Câmera'}
              </button>
            </div>

            {cameraActive && (
              <div className="mt-3 p-3 bg-slate-900 rounded-2xl text-center space-y-2">
                <video 
                  ref={videoRef} 
                  playsInline 
                  autoPlay 
                  className="w-full max-h-52 rounded-xl bg-black object-cover mx-auto" 
                />
                <button
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-md active:scale-95"
                >
                  Capturar Foto de Comprovante
                </button>
              </div>
            )}

            {cameraPhoto && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <img src={cameraPhoto} alt="Comprovante" className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Foto capturada com sucesso! Pronto para anexar.</span>
              </div>
            )}
          </div>

          {/* 3. Microfone */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Permissão de Microfone (Notas de Voz)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Grave áudios explicativos sobre o que foi comprado ou dividido.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAudioRecording}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 text-white active:scale-95 shrink-0 ${
                  audioRecording ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {audioRecording ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Parar Gravação</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Testar Microfone</span>
                  </>
                )}
              </button>
            </div>

            {audioUrl && (
              <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <audio controls src={audioUrl} className="h-8 w-full max-w-xs" />
                <span className="text-[11px] text-emerald-600 font-bold shrink-0">Áudio gravado! ✅</span>
              </div>
            )}
          </div>

          {/* 4. Arquivos e Fotos */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Fotos e Arquivos (Armazenamento)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Anexe PDFs de boletos ou imagens da sua galeria às contas.
                </p>
                {selectedFile && (
                  <p className="text-[11px] font-semibold text-purple-600 mt-1">
                    Arquivo selecionado: {selectedFile}
                  </p>
                )}
              </div>
            </div>
            <label className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer text-center active:scale-95 shrink-0">
              <span>Selecionar Arquivo</span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
            </label>
          </div>

          {/* 5. Agenda (Calendário) */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Agenda (Lembretes de Vencimento e Faxina)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Permissão para sincronizar datas de cobrança direto no calendário do telefone.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportToCalendar}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95 shrink-0"
            >
              {calendarSaved ? 'Exportado p/ Agenda ✅' : 'Adicionar à Agenda'}
            </button>
          </div>

        </div>
        {/* End of permissions grid */}

      </div>
      {/* End of scrollable body */}

      {/* Pinned Footer (Always visible) */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 z-10">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11px]">Todas as 6 permissões no <code>AndroidManifest.xml</code></span>
        </div>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95"
        >
          Fechar
        </button>
      </div>

    </div>
  </div>
  );
}
