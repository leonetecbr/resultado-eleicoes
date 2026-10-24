import { POSITIONS } from '../dictonarys';

const deputyPosition = uf => (uf === 'df' ? POSITIONS.DISTRICT : POSITIONS.STATE);

export default deputyPosition;

export { deputyPosition };
