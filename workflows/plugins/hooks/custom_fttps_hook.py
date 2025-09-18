import ftplib  # nosec: B402
import logging

from airflow.providers.ftp.hooks.ftp import FTPSHook

logger = logging.getLogger()


class CustomFTPSHook(FTPSHook):
    """Interact with FTPS.
    Extends the Airflow FTPSHook to allow unverified SSL connections
    Turns on secure data connection (PROT P)
    """

    def __init__(self, ftp_conn_id: str, ssl_context=None) -> None:
        super().__init__(ftp_conn_id)
        self.ssl_context = ssl_context

    def get_conn(self) -> ftplib.FTP:
        """Return an FTPS connection object."""

        if self.conn is None:
            params = self.get_connection(self.ftp_conn_id)
            pasv = params.extra_dejson.get("passive", True)

            if params.port:
                ftplib.FTP_TLS.port = params.port

            self.conn = ftplib.FTP_TLS(params.host, params.login, params.password)
            self.conn.set_pasv(pasv)
            self.conn.prot_p()

        return self.conn
