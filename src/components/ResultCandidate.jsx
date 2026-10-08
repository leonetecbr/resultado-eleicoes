// noinspection JSNonASCIINames

import { useApp } from '../hooks';
import { useMemo, Fragment } from 'react';
import { Alert, Avatar, Box, Chip, Divider, LinearProgress, Skeleton, Typography } from '@mui/material';

const votes = cand => Number(cand?.vap) || 0;

const isElected = cand => (cand?.e === 's' ? 1 : 0);

const bgCandColors = {
    'Eleito': 'bg-green-300 ',
    'Eleito por QP': 'bg-green-300 ',
    'Eleito por média': 'bg-green-200 ',
    '2º turno': 'bg-blue-300 ',
    'Não eleito': 'bg-red-300 ',
    'Suplente': 'bg-yellow-300 ',
}

const textCandColors = {
    'Eleito': 'success',
    'Eleito por QP': 'success ',
    'Eleito por média': 'success ',
    '2º turno': 'info',
    'Não eleito': 'error',
    'Suplente': 'warning',
}

const normalize = (s = '') =>
    String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const flattenCandidates = (agr = []) =>
    agr.flatMap(a => (a.par ?? []).flatMap(p => (p.cand ?? []).map(c => ({ ...c, par: p.sg, agr: a.nm }))));

function orderCandidates(dv, candidates) {
    if (dv === 'n') {
        return candidates;
    }

    return [...candidates].sort((a, b) => isElected(b) - isElected(a) || votes(b) - votes(a));
}

export function ResultCandidate({ data, loading }) {
    const { uf, getBaseUrl, POSITIONS, position, ROUNDS, round, search } = useApp();

    const candidates = useMemo(
        () =>
            orderCandidates(data?.dv, flattenCandidates(data?.carg?.[0]?.agr)) ||
            (round === ROUNDS.FIRST ? [1, 2, 3, 4, 5] : [1, 2]),
        [ROUNDS.FIRST, data, round]
    );

    const searched = useMemo(() => {
        const q = normalize(search);

        if (!q) {
            return candidates;
        }

        return candidates.filter(c => [c.nm, c.nmu, c.n, c.par].some(field => normalize(field).includes(q)));
    }, [candidates, search]);

    if (!loading && searched.length === 0) {
        return (
            <Alert severity="warning">
                Nenhum candidato encontrado para a busca &ldquo;{search}&rdquo;. Tente pesquisar pelo nome, número
                ou partido do candidato.
            </Alert>
        );
    }

    return searched.map((cand, index) => {
        if (typeof cand.pvap === 'string') cand.pvap = parseFloat(cand.pvap.replace(',', '.'));

        return (
            <Fragment key={loading ? index : cand.sqcand}>
                <Box className={`${!loading ? bgCandColors[cand?.st] ?? '' : ''}p-3 rounded my-3`}>
                    <Box className="flex justify-between">
                        <Box className="flex">
                            {loading ? (
                                <Skeleton variant="circular" width={56} height={64} />
                            ) : (
                                <Avatar
                                    alt={cand.nmu}
                                    className="h-16 w-14"
                                    src={`${getBaseUrl()}/fotos/${position === POSITIONS.PRESIDENT ? 'br' : uf}/${cand.sqcand}.jpeg`}
                                />
                            )}
                            <Box className="ml-2 flex flex-col">
                                <Box className="flex">
                                    {loading ? (
                                        <>
                                            <Skeleton width={150} height={24} className="mr-2" />
                                            <Skeleton width={30} height={24} />
                                        </>
                                    ) : (
                                        <>
                                            <Typography>{cand.nmu}</Typography>
                                            <Divider orientation="vertical" className="mx-2" />
                                            <Typography color="text.secondary" className="font-light">
                                                {cand.par}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                                <Box className="flex items-center">
                                    {loading ? (
                                        <>
                                            <Skeleton width={39} height={32} className="mr-2" />
                                            <Skeleton width={59} height={24} />
                                        </>
                                    ) : (
                                        <>
                                            <Chip label={cand.n} variant="outlined" className="mr-2" />
                                            <Typography color={textCandColors[cand.st] ?? ''} className="font-bold">{cand.st}</Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                        <Box className="flex items-end">
                            <Box sx={{ minWidth: 35 }}>
                                {loading ? (
                                    <Skeleton width={46} height={20} />
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        {cand.pvap.toLocaleString('pt-br', { minimumFractionDigits: 2 })}%
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box className="mt-3 w-full">
                        {loading ? (
                            <>
                                <Skeleton width={110} height={20} />
                                <Skeleton width="100%" height={4} />
                            </>
                        ) : (
                            <>
                                <Typography variant="body2" color="text.secondary">
                                    {parseInt(cand.vap).toLocaleString('pt-br')} votos
                                    {
                                        cand.dvt !== 'Válido' && (
                                            <Chip label={cand.dvt} color="warning" size="small" className="ml-2 mb-1" />
                                        )
                                    }
                                </Typography>
                                <LinearProgress variant="determinate" value={cand.pvap} />
                            </>
                        )}
                    </Box>
                </Box>
                <Divider className="my-4" />
            </Fragment>
        );
    });
}

export default ResultCandidate;
