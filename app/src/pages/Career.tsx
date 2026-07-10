import { IconBriefcase } from '../components/ui/icons';
import { ComingSoon } from './ComingSoon';

export function Career() {
  return (
    <ComingSoon
      icon={IconBriefcase}
      color="var(--c-career)"
      title="Карьерный маркетплейс"
      description="Не разовая помощь с трудоустройством, а постоянный поток лидов по рейтингу специалиста — с партнёрской сетью фитнес-клубов и корпоративных wellness-программ."
      items={[
        'Биржа заявок от школы, распределяемая по рейтингу специалиста',
        'Партнёрская сеть фитнес-клубов, клиник и ДМС-программ',
        'Франшиза мини-кабинета под брендом школы для топ-выпускников',
      ]}
    />
  );
}
