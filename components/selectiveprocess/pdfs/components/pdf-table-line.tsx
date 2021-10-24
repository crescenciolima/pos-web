import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFTableInfo } from './pdf-table';



interface Props {
    columnList: PDFTableInfo[];
}


export default function PDFTableLine(props: Props) {


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            borderBottomColor: 'white',
            backgroundColor: 'white',
            color: "black",
            borderBottomWidth: 1,
            borderColor:"black",
            alignItems: 'center',
            flexGrow: 1,
            fontSize: 10,
            paddingVertical:"3"
            

        },
    
    });

    const { columnList } = props;


    return (
        <View style={styles.container}>
            {columnList.map((column, index) => {
                return (
                    <Text  key={index} style={{ width: column.width, borderRightWidth: index+1 == columnList.length ? 0 : 1, marginHorizontal:"5", textAlign: column.textAlign, height:"100%" }}>{column.value || ""} </Text>
                )
            })}

        
        </View>
    )
}