import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '../../lib/store';
import { IconCamera } from '../ui/icons';
import { formatDate } from '../../lib/format';
import styles from './ProgressPhotos.module.css';

export function ProgressPhotos({ clientId }: { clientId: string }) {
  const { progressPhotos, addProgressPhoto, removeProgressPhoto } = useAppData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');

  const photos = useMemo(
    () =>
      progressPhotos.filter((p) => p.clientId === clientId).sort((a, b) => +new Date(a.takenAt) - +new Date(b.takenAt)),
    [progressPhotos, clientId],
  );

  useEffect(() => {
    if (photos.length === 0) return;
    setBeforeId((prev) => (photos.some((p) => p.id === prev) ? prev : photos[0].id));
    setAfterId((prev) => (photos.some((p) => p.id === prev) ? prev : photos[photos.length - 1].id));
  }, [photos]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addProgressPhoto(clientId, reader.result as string);
    reader.readAsDataURL(file);
    if (fileInput.current) fileInput.current.value = '';
  }

  const beforePhoto = photos.find((p) => p.id === beforeId);
  const afterPhoto = photos.find((p) => p.id === afterId);

  return (
    <>
      <label className={styles.uploadBtn}>
        <IconCamera width={15} height={15} />
        Добавить фото
        <input ref={fileInput} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      </label>

      {photos.length === 0 && <p className={styles.emptyHint}>Фото пока не добавлены.</p>}

      {photos.length > 0 && (
        <>
          <div className={styles.compareRow}>
            <div className={styles.compareSlot}>
              <label>До</label>
              <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)}>
                {photos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatDate(p.takenAt)}
                  </option>
                ))}
              </select>
              {beforePhoto && <img src={beforePhoto.photo} alt="До" className={styles.compareImg} />}
            </div>
            <div className={styles.compareSlot}>
              <label>После</label>
              <select value={afterId} onChange={(e) => setAfterId(e.target.value)}>
                {photos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatDate(p.takenAt)}
                  </option>
                ))}
              </select>
              {afterPhoto && <img src={afterPhoto.photo} alt="После" className={styles.compareImg} />}
            </div>
          </div>

          <div className={styles.gallery}>
            {photos.map((p) => (
              <div key={p.id} className={styles.galleryItem}>
                <img src={p.photo} alt="" className={styles.galleryThumb} />
                <span className={styles.galleryDate}>{formatDate(p.takenAt)}</span>
                <button className={styles.removeBtn} onClick={() => removeProgressPhoto(p.id)} aria-label="Удалить фото">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
