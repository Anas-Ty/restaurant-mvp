import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useQRCode = () => {
  const [searchParams] = useSearchParams();
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    // Get QR code from URL parameters or path
    const qrFromParams = searchParams.get('qr');
    const qrFromPath = window.location.pathname.split('/').pop();
    
    if (qrFromParams) {
      setQrCode(qrFromParams);
    } else if (qrFromPath && qrFromPath !== '' && qrFromPath !== 'menu') {
      setQrCode(qrFromPath);
    }
  }, [searchParams]);

  return qrCode;
};