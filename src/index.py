import os
import webview
from view_model import decorators, api
from time import time

class StateManager:
    @staticmethod
    def set_state(key, value):
        window = webview.active_window()
        if window:
            js_value = f'"{value}"' if isinstance(value, str) else value
            js_code = f'window.pywebview?.state?.set_{key}?.({js_value})'
            window.evaluate_js(js_code)

api_instance = api.Api()

@decorators.set_interval(1)
def update_ticker():
    StateManager.set_state("ticker", int(time()))
    StateManager.set_state("rpm", int(api_instance.car.rpm))
    StateManager.set_state("speed", int(api_instance.car.speed))
    StateManager.set_state("fuel", int(api_instance.car.fuel))
    StateManager.set_state("engine_load", int(api_instance.car.engine_load))

def get_entrypoint():
    paths = ['../gui/index.html', '../Resources/gui/index.html', './gui/index.html']

    for path in paths:
        if os.path.exists(os.path.join(os.path.dirname(__file__), path)):
            return path

    raise FileNotFoundError('No index.html found')

def main():
    webview.create_window(
        title='pywebview-react boilerplate', 
        url=get_entrypoint(), 
        js_api=api_instance
    )
    webview.start(update_ticker, debug=True)

if __name__ == '__main__':
    main()
