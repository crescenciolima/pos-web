import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react';
import homeStyle from '../styles/home.module.css'

export default function SiteFooter({course}) {
  
  return (
    <footer className={homeStyle.sectionPadding+' bg-footer'}>
            <div className="row">
              <div className="col-md-9 text-white">
                <div className="row">
                  <div className="col-12">
                    <h4>{course.name}</h4>
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="col-md-6">
                      <p>Coordenação:</p>
                      <p>
                        {course.coordName}<br /> 
                        {course.coordMail}
                      </p>
                  </div>
                  <div className="col-md-6">
                    <p>Campus Vitória da Conquista</p>
                    <p>Av. Sérgio Vieira de Mello, 3150 - Zabelê,<br />
                    Vitória da Conquista - BA, 45078-300
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 text-center align-items-center d-flex justify-content-center">
                <Image src="/images/ifba-logo-footer.png" layout="fixed" alt="logo"width="124" height="124" />
              </div>
            </div>
        </footer>
  )
}