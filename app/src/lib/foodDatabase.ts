export interface FoodItem {
  id: string;
  name: string;
  category: string;
  kcal100: number;
  protein100: number;
  fat100: number;
  carbs100: number;
}

/**
 * A local nutrition reference (per 100 g), structured the way a FatSecret-style
 * lookup would be used in a real product. There's no live FatSecret API
 * integration here — that needs server-side OAuth and API keys — so these
 * values are drawn from well-established public nutrition data, not fetched.
 */
export const FOOD_DATABASE: FoodItem[] = [
  { id: 'f1', name: 'Куриная грудка, отварная', category: 'Мясо и птица', kcal100: 165, protein100: 31, fat100: 3.6, carbs100: 0 },
  { id: 'f2', name: 'Говядина, постная', category: 'Мясо и птица', kcal100: 187, protein100: 26, fat100: 9, carbs100: 0 },
  { id: 'f3', name: 'Индейка, филе', category: 'Мясо и птица', kcal100: 157, protein100: 29, fat100: 3.9, carbs100: 0 },
  { id: 'f4', name: 'Лосось, запечённый', category: 'Рыба и морепродукты', kcal100: 208, protein100: 20, fat100: 13, carbs100: 0 },
  { id: 'f5', name: 'Треска, отварная', category: 'Рыба и морепродукты', kcal100: 90, protein100: 20, fat100: 0.8, carbs100: 0 },
  { id: 'f6', name: 'Креветки, отварные', category: 'Рыба и морепродукты', kcal100: 99, protein100: 21, fat100: 1.4, carbs100: 0.2 },
  { id: 'f7', name: 'Яйцо куриное', category: 'Яйца и молочное', kcal100: 155, protein100: 13, fat100: 11, carbs100: 1.1 },
  { id: 'f8', name: 'Творог 5%', category: 'Яйца и молочное', kcal100: 121, protein100: 17, fat100: 5, carbs100: 3 },
  { id: 'f9', name: 'Греческий йогурт натуральный', category: 'Яйца и молочное', kcal100: 97, protein100: 9, fat100: 5, carbs100: 4 },
  { id: 'f10', name: 'Сыр твёрдый', category: 'Яйца и молочное', kcal100: 350, protein100: 25, fat100: 27, carbs100: 1.3 },
  { id: 'f11', name: 'Молоко 2.5%', category: 'Яйца и молочное', kcal100: 52, protein100: 2.8, fat100: 2.5, carbs100: 4.7 },
  { id: 'f12', name: 'Овсяная крупа, сухая', category: 'Крупы и злаки', kcal100: 342, protein100: 12, fat100: 6, carbs100: 60 },
  { id: 'f13', name: 'Гречка, сухая', category: 'Крупы и злаки', kcal100: 313, protein100: 12.6, fat100: 3.3, carbs100: 62 },
  { id: 'f14', name: 'Рис белый, варёный', category: 'Крупы и злаки', kcal100: 130, protein100: 2.7, fat100: 0.3, carbs100: 28 },
  { id: 'f15', name: 'Киноа, варёная', category: 'Крупы и злаки', kcal100: 120, protein100: 4.4, fat100: 1.9, carbs100: 21 },
  { id: 'f16', name: 'Хлеб цельнозерновой', category: 'Крупы и злаки', kcal100: 247, protein100: 9, fat100: 3.4, carbs100: 41 },
  { id: 'f17', name: 'Макароны, варёные', category: 'Крупы и злаки', kcal100: 131, protein100: 5, fat100: 1.1, carbs100: 25 },
  { id: 'f18', name: 'Чечевица, варёная', category: 'Бобовые', kcal100: 116, protein100: 9, fat100: 0.4, carbs100: 20 },
  { id: 'f19', name: 'Нут, варёный', category: 'Бобовые', kcal100: 164, protein100: 8.9, fat100: 2.6, carbs100: 27 },
  { id: 'f20', name: 'Брокколи, отварная', category: 'Овощи', kcal100: 35, protein100: 2.4, fat100: 0.4, carbs100: 7 },
  { id: 'f21', name: 'Помидоры', category: 'Овощи', kcal100: 18, protein100: 0.9, fat100: 0.2, carbs100: 3.9 },
  { id: 'f22', name: 'Огурцы', category: 'Овощи', kcal100: 15, protein100: 0.7, fat100: 0.1, carbs100: 3.6 },
  { id: 'f23', name: 'Авокадо', category: 'Овощи', kcal100: 160, protein100: 2, fat100: 15, carbs100: 9 },
  { id: 'f24', name: 'Картофель, отварной', category: 'Овощи', kcal100: 87, protein100: 1.9, fat100: 0.1, carbs100: 20 },
  { id: 'f25', name: 'Банан', category: 'Фрукты', kcal100: 96, protein100: 1.1, fat100: 0.3, carbs100: 22 },
  { id: 'f26', name: 'Яблоко', category: 'Фрукты', kcal100: 52, protein100: 0.3, fat100: 0.2, carbs100: 14 },
  { id: 'f27', name: 'Ягоды (смесь)', category: 'Фрукты', kcal100: 43, protein100: 0.7, fat100: 0.3, carbs100: 10 },
  { id: 'f28', name: 'Миндаль', category: 'Орехи и семена', kcal100: 579, protein100: 21, fat100: 50, carbs100: 22 },
  { id: 'f29', name: 'Грецкий орех', category: 'Орехи и семена', kcal100: 654, protein100: 15, fat100: 65, carbs100: 14 },
  { id: 'f30', name: 'Семена льна', category: 'Орехи и семена', kcal100: 534, protein100: 18, fat100: 42, carbs100: 29 },
  { id: 'f31', name: 'Оливковое масло', category: 'Жиры и масла', kcal100: 884, protein100: 0, fat100: 100, carbs100: 0 },
  { id: 'f32', name: 'Арахисовая паста', category: 'Жиры и масла', kcal100: 588, protein100: 25, fat100: 50, carbs100: 20 },
];
