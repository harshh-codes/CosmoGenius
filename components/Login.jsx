import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from './../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();
    
    return (
        <View style={styles.mainContainer}>
            <Image 
                source={require('./../assets/images/login.png')}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.container}>
                <Text style={styles.title}>COSMOGENIUS</Text>
                
                <Text style={styles.description}>
                    Your personal skincare companion is here to revolutionize the way you care for your skin.
                    Discover expert recommendations tailored just for you, analyze your skin's health, and connect with nearby dermatologists
                </Text>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => router.push('auth/sign-in')}
                >
                    <Text style={styles.buttonText}>
                        Sign In With Cosmogenius
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.WHITE,
    },
    image: {
        width: width,
        height: height * 0.60,
    },
    container: {
        backgroundColor: Colors.WHITE,
        marginTop: -35,
        flex: 1,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        paddingHorizontal: 35,  // Slightly increased horizontal padding
        paddingTop: 45,         // Slightly increased top padding
    },
    title: {
        fontSize: 34,           // Slightly larger font
        fontFamily: 'outfit-bold',
        textAlign: 'center',
        marginBottom: 30,       // Increased bottom margin
        letterSpacing: 1,
    },
    description: {
        fontFamily: 'outfit',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#666',
        marginBottom: 45,       // Increased bottom margin
        paddingHorizontal: 10,  // Added padding for better text containment
    },
    button: {
        backgroundColor: '#000',
        borderRadius: 30,
        paddingVertical: 18,
        marginHorizontal: 15,   // Slightly increased horizontal margin
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 'auto',      // Push button to bottom
        marginBottom: 20,       // Add bottom margin
    },
    buttonText: {
        color: Colors.WHITE,
        textAlign: 'center',
        fontFamily: 'outfit-medium',
        fontSize: 16,
    }
});