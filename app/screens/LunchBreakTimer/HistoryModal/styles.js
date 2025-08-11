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
        maxHeight: '90%',
        minWidth: '90%',
        padding: 16,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
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
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    durationText: {
        color: '#333'
    },
    dateText: {
        color: '#000',
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
        marginTop: 20,
        color: '#999',
    },
});