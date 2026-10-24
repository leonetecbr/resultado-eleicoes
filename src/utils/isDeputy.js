import { POSITIONS } from '../dictonarys';

const isDeputy = position => position === POSITIONS.STATE || position === POSITIONS.DISTRICT;

export { isDeputy };
