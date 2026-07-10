import { IconBook } from '../components/ui/icons';
import { ComingSoon } from './ComingSoon';

export function Knowledge() {
  return (
    <ComingSoon
      icon={IconBook}
      color="var(--c-know)"
      title="База знаний и CME"
      description="Обновляемая библиотека исследований и протоколов вместо разового бонусного PDF — с обязательными часами повышения квалификации для поддержания статуса в рейтинге."
      items={[
        'Библиотека протоколов и разборов кейсов с поиском по теме',
        'Вебинары с врачами и профильными специалистами',
        'CME-часы, которые засчитываются в рейтинг карьерного маркетплейса',
      ]}
    />
  );
}
