import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import { WeightChart } from '../../components/charts/WeightChart';
import { ProgressPhotos } from '../../components/client/ProgressPhotos';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Progress.module.css';

export function Progress() {
  const { clientId } = useOutletContext<PortalContext>();
  const { clients, addWeightPoint } = useAppData();
  const [value, setValue] = useState('');

  const client = clients.find((c) => c.id === clientId);
  if (!client) return null;

  const first = client.weightHistory[0];
  const last = client.weightHistory[client.weightHistory.length - 1];
  const delta = first && last ? last.weightKg - first.weightKg : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(value);
    if (!num) return;
    addWeightPoint(clientId, num);
    setValue('');
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h3>Динамика веса</h3>
        {client.weightHistory.length > 1 && (
          <span className={styles.delta}>
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)} кг всего
          </span>
        )}
      </div>

      {client.weightHistory.length > 1 ? (
        <WeightChart points={client.weightHistory} color={client.color} />
      ) : (
        <div className={styles.empty}>Добавьте второй замер, чтобы увидеть график.</div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="number" step={0.1} min={30} max={250} placeholder="Новый замер, кг" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
          Записать
        </button>
      </form>

      <div className={styles.head} style={{ marginTop: '1.4rem' }}>
        <h3>Фото до/после</h3>
      </div>
      <ProgressPhotos clientId={clientId} />
    </div>
  );
}
