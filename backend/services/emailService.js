// backend/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({ // ¡CORRECTO!
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER, // 2002dilanchoque@gmail.com
        pass: process.env.EMAIL_PASS  // thwk rpes cgcj loxj
    }
});

// Función para enviar notificación al admin sobre nueva solicitud
const enviarNotificacionNuevaSolicitud = async (solicitudData) => {
    try {
        const mailOptions = {
            from: `Sistema EMI <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL, // Email del administrador
            subject: '🔔 Nueva Solicitud de Acceso - Sistema EMI',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2>📋 Nueva Solicitud de Acceso</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3 style="color: #333;">Detalles del Solicitante:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Nombre Completo:</td>
                <td style="padding: 10px;">${solicitudData.nombre} ${solicitudData.apellidos}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Correo Electrónico:</td>
                <td style="padding: 10px;">${solicitudData.correo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Número de CI:</td>
                <td style="padding: 10px;">${solicitudData.ci}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Celular:</td>
                <td style="padding: 10px;">${solicitudData.celular}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Fecha de Solicitud:</td>
                <td style="padding: 10px;">${new Date(solicitudData.fecha_solicitud).toLocaleString('es-ES')}</td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Ingresa al panel de administración para revisar y aprobar esta solicitud.
            </p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Notificación enviada al admin:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar notificación al admin:', error);
        return { success: false, error: error.message };
    }
};

// Función para enviar confirmación de aprobación al docente
const enviarConfirmacionAprobacion = async (docenteData) => {
    try {
        const mailOptions = {
            from: `Sistema EMI <${process.env.EMAIL_USER}>`,
            to: docenteData.correo,
            subject: '✅ Solicitud Aprobada - Acceso al Sistema EMI',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2> ¡Solicitud Aprobada!</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3 style="color: #333;">Estimado/a ${docenteData.nombre} ${docenteData.apellidos},</h3>
            
            <p style="color: #555; line-height: 1.6;">
              Nos complace informarte que tu solicitud de acceso al <strong>Sistema EMI</strong> ha sido 
              <span style="color: #28a745; font-weight: bold;">APROBADA</span>.
            </p>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #155724; margin-top: 0;">Datos de tu cuenta:</h4>
              <p style="color: #155724; margin: 5px 0;"><strong>Correo:</strong> ${docenteData.correo}</p>
              <p style="color: #155724; margin: 5px 0;"><strong>Rol:</strong> Docente</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Ya puedes iniciar sesión en el sistema utilizando tu correo electrónico y la contraseña 
              que registraste durante el proceso de solicitud.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Iniciar Sesión
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #e9ecef; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              <strong>Sistema EMI</strong> - Administración Académica
            </p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmación enviada al docente:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar confirmación al docente:', error);
        return { success: false, error: error.message };
    }
};

// Función para enviar notificación de rechazo al docente
const enviarNotificacionRechazo = async (docenteData) => {
    try {
        const mailOptions = {
            from: `Sistema EMI <${process.env.EMAIL_USER}>`,
            to: docenteData.correo,
            subject: '❌ Solicitud No Aprobada - Sistema EMI',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2>📋 Estado de tu Solicitud</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3 style="color: #333;">Estimado/a ${docenteData.nombre} ${docenteData.apellidos},</h3>
            
            <p style="color: #555; line-height: 1.6;">
              Lamentamos informarte que tu solicitud de acceso al <strong>Sistema EMI</strong> 
              no ha sido aprobada en esta ocasión.
            </p>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0;">
                Si consideras que esto es un error o deseas obtener más información sobre los 
                requisitos necesarios, te recomendamos contactar directamente con la administración.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Puedes volver a solicitar acceso en el futuro una vez que cumplas con todos los requisitos establecidos.
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #e9ecef; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Para consultas adicionales, contacta a la administración académica.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              <strong>Sistema EMI</strong> - Administración Académica
            </p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Notificación de rechazo enviada:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar notificación de rechazo:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    enviarNotificacionNuevaSolicitud,
    enviarConfirmacionAprobacion,
    enviarNotificacionRechazo
};