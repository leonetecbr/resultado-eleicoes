import { useApp } from '../hooks';
import { POSITIONS, ROUNDS, UFs } from '../dictonarys';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Collapse, Box } from '@mui/material';
import { hasSecondRound } from '../utils/index.js';

export function SelectUF() {
    const { uf, handleChangeUf, showSelectUF, round, position } = useApp();

    const handleChange = event => {
        handleChangeUf(event.target.value);
    };

    return (
        <Collapse in={showSelectUF} className="text-center">
            <Box className="mb-2 mt-3">
                <FormControl>
                    <InputLabel id="ufResultLabel">UF</InputLabel>
                    <Select
                        autoWidth
                        value={uf}
                        label="UF"
                        variant="standard"
                        onChange={handleChange}
                        labelId="ufResultLabel"
                    >
                        {UFs.map(({ label, value, second }) => {
                            return round === ROUNDS.FIRST ||
                                second ||
                                (hasSecondRound('br') && position === POSITIONS.PRESIDENT) ? (
                                <MenuItem value={value} key={value}>
                                    {label}
                                </MenuItem>
                            ) : (
                                ''
                            );
                        })}
                    </Select>
                    <FormHelperText>Selecione a UF</FormHelperText>
                </FormControl>
            </Box>
        </Collapse>
    );
}

export default SelectUF;
