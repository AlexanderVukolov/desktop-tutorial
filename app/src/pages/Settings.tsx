import { useRef, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { IconCamera } from '../components/ui/icons';
import { PAYMENT_METHOD_LABEL, PLAN_LABEL, PLAN_OPTIONS } from '../lib/subscription';
import { formatDate, formatRub, daysSince } from '../lib/format';
import type { PaymentMethod, SubscriptionPlan } from '../lib/types';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Settings.module.css';

export function Settings() {
  const { specialist, updateSpecialist, subscribeToPlan, cancelSubscription } = useAppData();
  const photoInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(specialist.name);
  const [role, setRole] = useState(specialist.role);
  const [birthDate, setBirthDate] = useState(specialist.birthDate ?? '');
  const [country, setCountry] = useState(specialist.country ?? '');
  const [city, setCity] = useState(specialist.city ?? '');
  const [saved, setSaved] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<Exclude<SubscriptionPlan, 'none'>>(
    specialist.plan === 'none' ? 'pro' : specialist.plan,
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(specialist.paymentMethod ?? 'card');

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSpecialist({ photo: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateSpecialist({ name, role, birthDate, country, city });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  function handlePay() {
    subscribeToPlan(selectedPlan, selectedMethod);
  }

  const daysToCharge = specialist.nextChargeDate ? -daysSince(specialist.nextChargeDate) : null;

  return (
    <div className={styles.stack}>
      <Card title="Профиль специалиста">
        <div className={styles.profileRow}>
          <label className={styles.avatarUpload} title="Загрузить фото">
            {specialist.photo ? (
              <img src={specialist.photo} alt="" className={styles.avatarPhotoLg} />
            ) : (
              <div className={styles.avatarPlaceholder}>{specialist.name[0]}</div>
            )}
            <span className={styles.avatarUploadHint}>
              <IconCamera width={15} height={15} />
            </span>
            <input ref={photoInput} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{specialist.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{specialist.role}</div>
          </div>
        </div>

        <form className={styles.fields} onSubmit={handleSaveProfile}>
          <div className={uiStyles.field}>
            <label htmlFor="name">Имя</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={uiStyles.field}>
            <label htmlFor="role">Специализация / роль</label>
            <input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className={uiStyles.field}>
            <label htmlFor="birthDate">Дата рождения</label>
            <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className={styles.fieldRow}>
            <div className={uiStyles.field}>
              <label htmlFor="country">Страна</label>
              <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Например, Россия" />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="city">Город</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Например, Москва" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} style={{ alignSelf: 'flex-start' }}>
              Сохранить профиль
            </button>
            {saved && <span className={styles.savedNote}>Сохранено ✓</span>}
          </div>
        </form>
      </Card>

      <Card title="Подписка на Nutri.OS" hint="Продление раз в 30 дней, спишется автоматически выбранным способом">
        {specialist.plan !== 'none' && specialist.nextChargeDate && (
          <div className={styles.currentPlanBox}>
            <div className={styles.currentPlanInfo}>
              <div className="name">
                Тариф {PLAN_LABEL[specialist.plan]} · {specialist.paymentMethod && PAYMENT_METHOD_LABEL[specialist.paymentMethod]}
              </div>
              <div className="meta">
                Следующее списание: {formatDate(specialist.nextChargeDate)}
                {daysToCharge !== null && ` (через ${daysToCharge} дн.)`}
              </div>
            </div>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={cancelSubscription}>
              Отменить подписку
            </button>
          </div>
        )}

        <div className={styles.planGrid}>
          {PLAN_OPTIONS.map((plan) => (
            <div
              key={plan.value}
              className={`${styles.planCard} ${selectedPlan === plan.value ? styles.planCardActive : ''}`}
              onClick={() => setSelectedPlan(plan.value)}
            >
              <span className={styles.planName}>{plan.label}</span>
              <span className={styles.planPrice}>
                {formatRub(plan.price)} <span>/ мес</span>
              </span>
              <ul className={styles.planFeatures}>
                {plan.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.methodRow}>
          <button
            className={`${styles.methodBtn} ${selectedMethod === 'card' ? styles.methodBtnActive : ''}`}
            onClick={() => setSelectedMethod('card')}
          >
            Банковская карта
          </button>
          <button
            className={`${styles.methodBtn} ${selectedMethod === 'sbp' ? styles.methodBtnActive : ''}`}
            onClick={() => setSelectedMethod('sbp')}
          >
            СБП
          </button>
        </div>

        <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} style={{ marginTop: '1.1rem' }} onClick={handlePay}>
          Оплатить {formatRub(PLAN_OPTIONS.find((p) => p.value === selectedPlan)!.price)}
        </button>
      </Card>
    </div>
  );
}
