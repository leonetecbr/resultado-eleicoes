import { useApp } from './hooks';
import Result from './components/Result';
import SelectUF from './components/SelectUF';
import GitHubIcon from '@mui/icons-material/GitHub';
import { POSITIONS, ROUNDS, UFs } from './dictonarys';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Container, CssBaseline, Link, Tab } from '@mui/material';

const hasSecondRound = uf => UFs.some(u => u.value === uf && u.second);
const deputyPosition = uf => (uf === 'df' ? POSITIONS.DISTRICT : POSITIONS.STATE);
const isDeputy = position => position === POSITIONS.STATE || position === POSITIONS.DISTRICT;

function App() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showSelectUF, setShowSelectUF] = useState(false);
    const { uf, setUf, code, round, setRound, position, setPosition, setSearch, getBaseUrl } = useApp();

    const refreshingTimeoutID = useRef(null);
    const abortControllerRef = useRef(null);

    // Cargos que não são presidente precisam de uma UF selecionada
    const canFetch = position === POSITIONS.PRESIDENT || uf !== 'br';

    const fetchData = useCallback(() => {
        if (!canFetch) return;

        const url = `${getBaseUrl()}/dados/${uf}/${uf}-c${position.padStart(4, '0')}-e${code.padStart(6, '0')}-u.json`;

        abortControllerRef.current?.abort();

        const controller = new AbortController();

        abortControllerRef.current = controller;

        fetch(url, { signal: controller.signal })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Erro ${res.status} ao buscar ${url}`);
                }

                return res.json();
            })
            .then(result => {
                setError(false);
                setData(result);
                setIsLoaded(true);

                clearTimeout(refreshingTimeoutID.current);
                refreshingTimeoutID.current = setTimeout(() => setRefreshing(false), 1000);
            })
            .catch(err => {
                // Requisição cancelada por uma mais nova: não é um erro real
                if (err.name === 'AbortError') return;

                setError(true);
                setIsLoaded(true);
                setRefreshing(false);
            });
    }, [canFetch, position, uf, getBaseUrl, code]);

    // Busca inicial e sempre que UF, cargo ou turno mudarem
    useEffect(() => {
        fetchData();

        return () => abortControllerRef.current?.abort();
    }, [fetchData]);

    // Atualiza a cada 60s enquanto a apuração não terminou
    useEffect(() => {
        if (!canFetch || data?.tf === 's') return;

        const id = setInterval(() => {
            setRefreshing(true);
            fetchData();
        }, 60000);

        return () => clearInterval(id);
    }, [canFetch, fetchData, data?.tf]);

    useEffect(() => () => clearTimeout(refreshingTimeoutID.current), []);

    function handleRetry() {
        setError(false);
        setIsLoaded(false);
        fetchData();
    }

    function handleChangeRound(event, newValue) {
        setIsLoaded(false);
        setRound(newValue);
        setError(false);

        if (newValue === ROUNDS.SECOND) {
            // O segundo turno só existe para presidente e governador
            if (position !== POSITIONS.PRESIDENT && position !== POSITIONS.GOVERNOR) {
                setPosition(POSITIONS.PRESIDENT);
                setUf('br');
            } else {
                // Se a UF selecionada não tem segundo turno, volta para Brasil e mostra o select de UF
                const current = UFs.find(u => u.value === uf);

                if (current && !current.second) {
                    setUf('br');
                    setShowSelectUF(true);
                }
            }
        }
        // Voltando ao primeiro turno: restaura a UF salva (se houver) e esconde o select
        else {
            const savedUf = localStorage.getItem('uf');

            if (savedUf && position !== POSITIONS.PRESIDENT) {
                setUf(savedUf);

                if (isDeputy(position)) setPosition(deputyPosition(savedUf));
                if (showSelectUF) setShowSelectUF(false);
            }
        }
    }

    function handleChangePosition(event, newValue) {
        setSearch('');
        setError(false);
        setIsLoaded(false);
        setShowSelectUF(false);

        // Presidente é sempre Brasil
        if (newValue === POSITIONS.PRESIDENT) {
            setPosition(newValue);
            setUf('br');

            return;
        }

        const savedUf = localStorage.getItem('uf');
        let newUf = uf;

        if (savedUf) {
            // No segundo turno só vale a UF salva se ela tiver segundo turno
            const valid = round === ROUNDS.FIRST || hasSecondRound(savedUf);

            newUf = valid ? savedUf : 'br';

            if (!valid) setShowSelectUF(true);
        } else {
            // Sem UF salva, o usuário precisa escolher uma
            setShowSelectUF(true);
        }

        // Deputado estadual/distrital é sempre derivado da UF final
        setPosition(isDeputy(newValue) ? deputyPosition(newUf) : newValue);
        setUf(newUf);
    }

    function handleClickPosition(value) {
        // Clicar na aba já selecionada (ou entre estadual/distrital) abre/fecha o select de UF
        if (value === position || (isDeputy(position) && isDeputy(value))) {
            setShowSelectUF(prevSelect => !prevSelect);
        }
    }

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

    const showResult = position === POSITIONS.PRESIDENT || uf !== 'br';

    let load = null;

    if (showResult) {
        load = error ? (
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={handleRetry}>
                        Tentar novamente
                    </Button>
                }
            >
                Não foi possível obter os resultados da eleição!
            </Alert>
        ) : (
            <Result data={data} loading={!isLoaded} refreshing={refreshing} />
        );
    }

    const deputyValue = deputyPosition(uf);
    const typeDeputy = uf === 'df' ? 'Distrital' : 'Estadual';
    const showUF = (...positions) => uf !== 'br' && positions.includes(position);

    return (
        <>
            <Container component="main">
                <CssBaseline />
                <TabContext value={round}>
                    <Box className="border-b border-gray-300">
                        <TabList onChange={handleChangeRound} aria-label="Turnos da eleição">
                            <Tab label="1º Turno" value={ROUNDS.FIRST} />
                            {/*<Tab label="2º Turno" value={ROUNDS.SECOND} />*/}
                        </TabList>
                    </Box>
                    <TabPanel value={ROUNDS.FIRST} className="p-1">
                        <TabContext value={position}>
                            <Box className="border-b border-gray-300">
                                <TabList variant="scrollable" scrollButtons allowScrollButtonsMobile onChange={handleChangePosition} aria-label="Cargos da eleição">
                                    <Tab
                                        value={POSITIONS.PRESIDENT}
                                        onClick={() => handleClickPosition(POSITIONS.PRESIDENT)}
                                        label={`Presidente${showUF(POSITIONS.PRESIDENT) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                    <Tab
                                        value={POSITIONS.GOVERNOR}
                                        onClick={() => handleClickPosition(POSITIONS.GOVERNOR)}
                                        label={`Governador${showUF(POSITIONS.GOVERNOR) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                    <Tab
                                        value={POSITIONS.SENATOR}
                                        onClick={() => handleClickPosition(POSITIONS.SENATOR)}
                                        label={`Senador${showUF(POSITIONS.SENATOR) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                    <Tab
                                        value={POSITIONS.FEDERAL}
                                        onClick={() => handleClickPosition(POSITIONS.FEDERAL)}
                                        label={`Deputado Federal${showUF(POSITIONS.FEDERAL) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                    <Tab
                                        value={deputyValue}
                                        onClick={() => handleClickPosition(deputyValue)}
                                        label={`Deputado ${typeDeputy}${showUF(POSITIONS.STATE, POSITIONS.DISTRICT) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                </TabList>
                            </Box>
                            <TabPanel value={position} className="p-0 pt-2">
                                <SelectUF uf={uf} setUf={handleChangeUf} show={showSelectUF} />
                                {load}
                            </TabPanel>
                        </TabContext>
                    </TabPanel>
                    <TabPanel value={ROUNDS.SECOND} className="p-1">
                        <TabContext value={position}>
                            <Box className="border-b border-gray-300">
                                <TabList onChange={handleChangePosition} aria-label="Cargos da eleição">
                                    <Tab
                                        value={POSITIONS.PRESIDENT}
                                        onClick={() => handleClickPosition(POSITIONS.PRESIDENT)}
                                        label={`Presidente${showUF(POSITIONS.PRESIDENT) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                    <Tab
                                        value={POSITIONS.GOVERNOR}
                                        onClick={() => handleClickPosition(POSITIONS.GOVERNOR)}
                                        label={`Governador${showUF(POSITIONS.GOVERNOR) ? ` - ${uf.toUpperCase()}` : ''}`}
                                    />
                                </TabList>
                            </Box>
                            <TabPanel value={position} className="p-0 pt-2">
                                <SelectUF uf={uf} setUf={handleChangeUf} turno={2} show={showSelectUF} />
                                {load}
                            </TabPanel>
                        </TabContext>
                    </TabPanel>
                </TabContext>
            </Container>
            {isLoaded && (
                <Box component="footer" className="p-2 text-center">
                    <Link href="https://github.com/leonetecbr/resultado-eleicoes" color="inherit" aria-label="GitHub">
                        <GitHubIcon />
                    </Link>
                </Box>
            )}
        </>
    );
}

export default App;
