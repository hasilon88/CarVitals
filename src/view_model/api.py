import webview
from model import vehicle
from view_model import state_manager

class Api:
    def __init__(self):
        self.car = vehicle.Vehicle()

    def fetch_all_supported_commands(self, optional_args):
        return self.car.fetch_all_supported_commands()

    def query(self, obd_command_name):
        return self.car.query(obd_command_name)

    def fullscreen(self):
        window = webview.active_window()
        if window:
            window.toggle_fullscreen()
        else:
            print("No active webview window found.")
