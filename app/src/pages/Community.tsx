import { useMemo, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { getLevel, LEVEL_LABEL } from '../lib/career';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Community.module.css';

function timeAgo(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.round(hours / 24)} дн назад`;
}

export function Community() {
  const { specialist, clients, communityPosts, leaderboard, addCommunityPost, toggleLikePost } = useAppData();
  const [draft, setDraft] = useState('');

  const posts = [...communityPosts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const board = useMemo(() => {
    const rows = [
      ...leaderboard.map((p) => ({ id: p.id, name: p.name, rating: p.rating, clients: p.clients, isMe: false })),
      { id: 'me', name: specialist.name, rating: specialist.rating, clients: clients.length, isMe: true },
    ];
    return rows.sort((a, b) => b.rating - a.rating);
  }, [leaderboard, specialist, clients.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    addCommunityPost(draft.trim());
    setDraft('');
  }

  return (
    <div className={styles.grid}>
      <div className={styles.stack}>
        <Card title="Комьюнити выпускников" hint="Кейсы, вопросы и поддержка от коллег">
          <form className={styles.composer} onSubmit={handleSubmit}>
            <textarea
              placeholder="Поделитесь кейсом или задайте вопрос коллегам…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} style={{ alignSelf: 'flex-end' }}>
              Опубликовать
            </button>
          </form>
        </Card>

        <div className={styles.postList}>
          {posts.map((p) => (
            <div key={p.id} className={styles.post}>
              <div className={styles.postHead}>
                <div className={styles.avatar}>{p.authorName[0]}</div>
                <span className={styles.postAuthor}>{p.authorName}</span>
                <span className={styles.levelChip}>{LEVEL_LABEL[p.authorLevel]}</span>
                <span className={styles.postTime}>{timeAgo(p.createdAt)}</span>
              </div>
              <p className={styles.postText}>{p.text}</p>
              <div className={styles.postFooter}>
                <button
                  className={`${styles.likeBtn} ${p.likedByMe ? styles.likeBtnActive : ''}`}
                  onClick={() => toggleLikePost(p.id)}
                >
                  {p.likedByMe ? '♥' : '♡'} {p.likes}
                </button>
                <span className={styles.repliesNote}>{p.replies} ответов</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card title="Топ выпускников" hint="Рейтинг определяет видимость в карьерном маркетплейсе">
        <div className={styles.leaderboard}>
          {board.map((row, i) => (
            <div key={row.id} className={`${styles.leaderRow} ${row.isMe ? styles.leaderRowMe : ''}`}>
              <span className={styles.rank}>{i + 1}</span>
              <div className={styles.leaderName}>
                {row.name} {row.isMe && '(вы)'}
                <div className={styles.leaderMeta}>
                  {LEVEL_LABEL[getLevel(row.rating)]} · {row.clients} клиентов
                </div>
              </div>
              <span className={styles.leaderRating}>★ {row.rating.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
