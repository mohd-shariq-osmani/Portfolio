import logging
import socket
from zeroconf import IPVersion, ServiceInfo, Zeroconf

logger = logging.getLogger("DiscoveryService")

def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

class DiscoveryService:
    def __init__(self, port: int = 5389):
        self.port = port
        self.zeroconf = None
        self.info = None

    def start(self):
        try:
            self.zeroconf = Zeroconf(ip_version=IPVersion.V4Only)
            local_ip = get_local_ip()
            ip_bytes = socket.inet_aton(local_ip)
            
            # Service type must be _relay-remote._tcp.local.
            service_type = "_relay-remote._tcp.local."
            # Service name must end with the type, using the host machine's name
            hostname = socket.gethostname().split('.')[0]
            service_name = f"{hostname}.{service_type}"
            
            self.info = ServiceInfo(
                type_=service_type,
                name=service_name,
                addresses=[ip_bytes],
                port=self.port,
                properties={"version": "1.0", "host": socket.gethostname()},
            )
            
            self.zeroconf.register_service(self.info)
            logger.info(f"mDNS Service registered: {service_name} at {local_ip}:{self.port}")
        except Exception as e:
            logger.error("Failed to start discovery service", exc_info=True)

    def stop(self):
        if self.zeroconf:
            logger.info("Unregistering mDNS service...")
            try:
                if self.info:
                    self.zeroconf.unregister_service(self.info)
                self.zeroconf.close()
            except Exception as e:
                logger.error(f"Error closing zeroconf: {e}")
            self.zeroconf = None
            self.info = None
