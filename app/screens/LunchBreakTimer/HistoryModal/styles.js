import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        width: '100%',
        maxHeight: '80%',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    calendarButtonText: {
        marginLeft: 8,
        color: '#007AFF',
        fontWeight: '500',
    },
    list: {
        flexGrow: 0,
    },
    item: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    weekDayText: {
        fontSize: 14,
        color: '#666',
    },
    timeText: {
        fontSize: 14,
        marginTop: 4,
        color: '#333',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontStyle: 'italic',
    },
});