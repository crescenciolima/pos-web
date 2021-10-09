import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFTableInfo } from './pdf-table';



interface Props {
    headerList: PDFTableInfo[];
}


export default function PDFTableHeader(props: Props) {


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            borderBottomColor: 'black',
            backgroundColor: 'black',
            color: "white",
            borderBottomWidth: 1,
            alignItems: 'center',
            flexGrow: 1,
            fontSize: 11,
            paddingVertical:"3"
            

        },
    
    });

    const { headerList } = props;


    return (
        <View style={styles.container}>
            {headerList.map((header, index) => {
                return (
                    <Text  key={index} style={{ width: header.width, borderRightWidth: index+1 == headerList.length ? 0 : 1, marginHorizontal:"5", textAlign: header.textAlign }}>{header.value} </Text>
                )
            })}

        
        </View>
    )
}