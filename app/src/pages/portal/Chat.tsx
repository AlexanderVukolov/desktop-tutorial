import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import { IconArrowRight } from '../../components/ui/icons';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Chat.module.css';

export function Chat() {
  const { clientId } = useOutletContext<PortalContext>();
  const { messages, addMessage } = useAppData();
  const [text, setText] = useState('');

  const thread = messages.filter((m) => m.clientId === clientId).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage(clientId, 'client', text.trim());
    setText('');
  }

  return (
    <div>
      <div className={styles.thread}>
        {thread.length === 0 && <div className={styles.empty}>Напишите специалисту, если есть вопросы по питанию.</div>}
        {thread.map((m) => (
          <div key={m.id} className={`${styles.row} ${m.from === 'client' ? styles.rowClient : ''}`}>
            <div className={`${styles.bubble} ${m.from === 'client' ? styles.bubbleClient : styles.bubbleSpecialist}`}>
              {m.text}
              <span className={styles.time}>
                {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(m.createdAt))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input placeholder="Написать сообщение…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${styles.sendBtn}`} aria-label="Отправить">
          <IconArrowRight width={17} height={17} />
        </button>
      </form>
    </div>
  );
}
