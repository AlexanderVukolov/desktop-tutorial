import { IconCommunity } from '../components/ui/icons';
import { ComingSoon } from './ComingSoon';

export function Community() {
  return (
    <ComingSoon
      icon={IconCommunity}
      color="var(--c-comm)"
      title="Комьюнити выпускников"
      description="Закрытый клуб с менторством от старших потоков и геймификацией уровней — рейтинг здесь напрямую влияет на видимость в карьерном маркетплейсе."
      items={[
        'Менторство новых потоков от опытных выпускников',
        'Уровни junior / senior / expert с открытыми привилегиями',
        'Общие разборы сложных кейсов и нетворкинг',
      ]}
    />
  );
}
