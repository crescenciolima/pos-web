import React from 'react';
import {Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
   
    titleContainer:{
        flexDirection: 'column',
        justifyContent:'center',
        textAlign:'center'
    },
    title:{
        color: 'black',
        fontSize: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom:'6',
        marginTop:'15',
    },
    subTitle:{
        color: 'black',
        fontSize: 11,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom:'6',
    },
    step:{
        color: 'black',
        fontSize: 11,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom:'6',
        marginTop: "6",
        fontWeight:'bold',
    },
    logo:{
        marginLeft: 'auto',
        marginRight: 'auto',
    },
  });


  const PDFHeader = ({title, description, step, logoW = "30%"}) => (
    <View style={styles.titleContainer}>
        <Image src="/images/ifbavca.png" style={[styles.logo, {width: logoW}]}></Image>
        <Text style={styles.title}>{title || ""}</Text>
        <Text style={styles.subTitle}>{description || ""}</Text>
        <Text style={styles.step}>{step || ""}</Text>
    </View>
  );
  
  export default PDFHeader