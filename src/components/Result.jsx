import {
    Alert,
    Avatar,
    Box,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import { useApp } from '../hooks';
import ResultCandidate from './ResultCandidate';
import ErrorIcon from '@mui/icons-material/Error';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';

export function Result({ data, loading, refreshing }) {
    const { search, setSearch } = useApp();

    return (
        <Box>
            {loading ? (
                <>
                    <Skeleton width={300} height={32} />
                    <Skeleton width="100%" height={4} />
                </>
            ) : (
                <>
                    <Typography variant="h5">{data.s.pst}% das seções totalizadas</Typography>
                    <LinearProgress variant="determinate" value={parseFloat(data.s.pst)} className="my-2" />
                </>
            )}

            <Box className="mb-2 flex flex-wrap justify-between">
                {loading ? (
                    <Skeleton width={320} height={24} />
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Última atualização em {data.dg} {data.hg}
                        {refreshing && <CircularProgress size={15} className="ml-2" thickness={6} />}
                    </Typography>
                )}
            </Box>
            <Box className="mx-auto mb-3 columns-3xs">
                <List>
                    <ListItem>
                        <ListItemAvatar>
                            {loading ? (
                                <Skeleton variant="circular" width={40} height={40} />
                            ) : (
                                <Avatar>
                                    <PeopleIcon />
                                </Avatar>
                            )}
                        </ListItemAvatar>
                        {loading ? (
                            <Box className="flex flex-col">
                                <Skeleton width={100} height={24} />
                                <Skeleton width={150} height={20} />
                            </Box>
                        ) : (
                            <ListItemText
                                primary="Já foram contabilizados"
                                secondary={parseInt(data.v.vv).toLocaleString('pt-br') + ' votos válidos'}
                            />
                        )}
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            {loading ? (
                                <Skeleton variant="circular" width={40} height={40} />
                            ) : (
                                <Avatar>
                                    <GroupAddIcon />
                                </Avatar>
                            )}
                        </ListItemAvatar>
                        {loading ? (
                            <Box className="flex flex-col">
                                <Skeleton width={100} height={24} />
                                <Skeleton width={150} height={20} />
                            </Box>
                        ) : (
                            <ListItemText
                                primary="Eleitorado não totalizado"
                                secondary={
                                    parseInt(data.e.esnt).toLocaleString('pt-br') + ' eleitores'
                                }
                            />
                        )}
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            {loading ? (
                                <Skeleton variant="circular" width={40} height={40} />
                            ) : (
                                <Avatar>
                                    <NoAccountsIcon />
                                </Avatar>
                            )}
                        </ListItemAvatar>
                        {loading ? (
                            <Box className="flex flex-col">
                                <Skeleton width={100} height={24} />
                                <Skeleton width={150} height={20} />
                            </Box>
                        ) : (
                            <ListItemText
                                primary="Os que faltaram"
                                secondary={'Somam ' + parseInt(data.e.a).toLocaleString('pt-br') + ' pessoas'}
                            />
                        )}
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            {loading ? (
                                <Skeleton variant="circular" width={40} height={40} />
                            ) : (
                                <Avatar>
                                    <ErrorIcon />
                                </Avatar>
                            )}
                        </ListItemAvatar>
                        {loading ? (
                            <Box className="flex flex-col">
                                <Skeleton width={100} height={24} />
                                <Skeleton width={150} height={20} />
                            </Box>
                        ) : (
                            <ListItemText
                                primary="Brancos e nulos"
                                secondary={
                                    'Somam ' +
                                    (parseInt(data.v.tvn) + parseInt(data.v.vb)).toLocaleString('pt-br') +
                                    ' votos'
                                }
                            />
                        )}
                    </ListItem>
                </List>
            </Box>
            <TextField
                fullWidth
                size="small"
                className="mb-5"
                placeholder="Buscar candidato, número ou partido"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {!loading && (data?.md === 's' || data?.md === 'e') && data?.tf === 'n' && (
                <Alert severity="success" className="mb-4">
                    Eleição matematicamente definida: {data.md === 's' ? 'Segundo turno' : 'Candidato eleito'}
                </Alert>
            )}
            <ResultCandidate data={data} loading={loading} />
        </Box>
    );
}

export default Result;
