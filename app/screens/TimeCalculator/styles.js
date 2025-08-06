import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 24,
        textAlign: 'center',
    },
    sliderBlock: {
        marginBottom: 24,
    },
    label: {
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 8,
    },
    slider: {
        width: '100%',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 24,
    },
    modeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    activeButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
    },
    resultBlock: {
        alignItems: 'center',
        marginTop: 16,
    },
    resultLabel: {
        color: '#aaa',
        fontSize: 14,
    },
    result: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 4,
    },
    timeBox: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginBottom: 24,
        backgroundColor: '#1E1E1E',
    },

});
