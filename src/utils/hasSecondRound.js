import { UFs } from '../dictonarys/ufs';

const hasSecondRound = uf => UFs.some(u => u.value === uf && u.second);

export default hasSecondRound;

export { hasSecondRound };
