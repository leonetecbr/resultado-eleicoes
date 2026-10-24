import { AppContext } from './AppContext';
import { useCallback, useState } from 'react';
import { POSITIONS, ROUNDS } from '../dictonarys';
import { isDeputy, deputyPosition } from '../utils';

function AppProvider({ children }) {
    const [uf, setUf] = useState('br');
    const [round, setRound] = useState(ROUNDS.SECOND);
    const [search, setSearch] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [position, setPosition] = useState(POSITIONS.PRESIDENT);
    const [showSelectUF, setShowSelectUF] = useState(false);
    const ELECTORAL_CYCLE = import.meta.env.VITE_ELECTORAL_CYCLE || 'ele2026';
    const code = position !== POSITIONS.PRESIDENT ? (parseInt(round) + 2).toString() : round;

    const getBaseUrl = useCallback(
        () => `https://resultados.tse.jus.br/oficial/${ELECTORAL_CYCLE}/${code}`,
        [ELECTORAL_CYCLE, code]
    );

    function handleChangeUf(newUf) {
        if (newUf !== 'br') {
            localStorage.setItem('uf', newUf);

            if (isDeputy(position)) {
                setPosition(deputyPosition(newUf));
            }
        }

        // Só volta para o loading se a UF realmente mudou, senão nada refaz a busca
        if (newUf !== uf) setIsLoaded(false);

        setUf(newUf);
        setShowSelectUF(false);
    }

    return (
        <AppContext.Provider
            value={{
                uf,
                setUf,
                code,
                round,
                setRound,
                position,
                setPosition,
                search,
                setSearch,
                isDeputy,
                getBaseUrl,
                isLoaded,
                setIsLoaded,
                showSelectUF,
                setShowSelectUF,
                handleChangeUf,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export default AppProvider;

export { AppProvider };
