import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import PDFTableHeader from './pdf-table-header';
import PDFTableLine from './pdf-table-line';

export interface PDFTableInfo {
    value: string;
    width: string;
    textAlign: 'left' | 'right' | 'center' | 'justify';
}

interface Props {
    title: string;
    headerList: PDFTableInfo[];
    lines: PDFTableInfo[][];
}

export default function PDFTable(props: Props) {



    const styles = StyleSheet.create({

        tableContainer: {
            flexDirection: 'column',
            marginTop: 14,
            justifyContent: 'center',
            textAlign: 'center',
        },
        title: {
            color: 'black',
            fontSize: 12,
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: '6',
            marginTop: '15',
        },

    });

    const { headerList, title, lines } = props;


    return (
        <View style={styles.tableContainer}>
            <Text style={styles.title}>{title}</Text>
            <PDFTableHeader headerList={headerList} />
            {lines.map((line, index) => {
                return (
                    <PDFTableLine columnList={line} key={index} />
                )
            })}
            
        </View>
    )
}